use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, UnorderedMap, UnorderedSet, Vector};
use near_sdk::json_types::{Base64VecU8, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, AccountId, Balance, CryptoHash, PanicOnDefault, Promise, PromiseOrValue,
};
use std::collections::HashMap;

pub use crate::approval::*;
pub use crate::events::*;
use crate::internal::*;
pub use crate::metadata::*;
pub use crate::mint::*;
pub use crate::nft_core::*;
pub use crate::royalty::*;

mod approval;
mod enumeration;
mod events;
mod internal;
mod metadata;
mod mint;
mod nft_core;
mod royalty;

/// This spec can be treated like a version of the standard.
pub const NFT_METADATA_SPEC: &str = "1.0.0";
/// This is the name of the NFT standard we're using
pub const NFT_STANDARD_NAME: &str = "nep171";

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    //contract owner
    pub owner_id: AccountId,

    //keeps track of all the token IDs for a given account
    pub tokens_per_owner: LookupMap<AccountId, UnorderedSet<TokenId>>,

    //keeps track of the token struct for a given token ID
    pub tokens_by_id: LookupMap<TokenId, Token>,

    //keeps track of the token metadata for a given token ID
    pub token_metadata_by_id: UnorderedMap<TokenId, TokenMetadata>,

    // owner of token
    pub owner_of_token: LookupMap<TokenId, AccountId>,

    //keeps track of artists
    pub artist_list: UnorderedSet<AccountId>,

    //keeps track of the metadata for the contract
    pub metadata: LazyOption<NFTContractMetadata>,
    product_list: LookupMap<String, String>,
    product_price: LookupMap<String, String>,
    product_names: Vector<String>,
    sold_price: Vector<String>,
    sold_item: LookupMap<String, Vec<String>>,
    sold_name: Vector<String>,
    owned_items: LookupMap<String, Vec<String>>,
    products_by_owner: LookupMap<AccountId, Vec<String>>,
}

/// Helper structure for keys of the persistent collections.
#[derive(BorshSerialize)]
pub enum StorageKey {
    TokensPerOwner,
    TokenPerOwnerInner { account_id_hash: CryptoHash },
    TokensById,
    TokenMetadataById,
    NFTContractMetadata,
    TokensPerType,
    TokensPerTypeInner { token_type_hash: CryptoHash },
    TokenTypesLocked,
}

#[near_bindgen]
impl Contract {
    /*
        initialization function (can only be called once).
        this initializes the contract with default metadata so the
        user doesn't have to manually type metadata.
    */
    #[init]
    pub fn new_default_meta(owner_id: AccountId) -> Self {
        //calls the other function "new: with some default metadata and the owner_id passed in
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: "nft-1.0.0".to_string(),
                name: "NFT Tutorial Contract".to_string(),
                symbol: "GOTEAM".to_string(),
                icon: None,
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    /*
        initialization function (can only be called once).
        this initializes the contract with metadata that was passed in and
        the owner_id.
    */
    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata) -> Self {
        //create a variable of type Self with all the fields initialized.
        let this = Self {
            //Storage keys are simply the prefixes used for the collections. This helps avoid data collision
            tokens_per_owner: LookupMap::new(StorageKey::TokensPerOwner.try_to_vec().unwrap()),
            tokens_by_id: LookupMap::new(StorageKey::TokensById.try_to_vec().unwrap()),
            token_metadata_by_id: UnorderedMap::new(
                StorageKey::TokenMetadataById.try_to_vec().unwrap(),
            ),
            //set the owner_id field equal to the passed in owner_id.
            owner_id,
            metadata: LazyOption::new(
                StorageKey::NFTContractMetadata.try_to_vec().unwrap(),
                Some(&metadata),
            ),
            product_list: LookupMap::new(b"productList".to_vec()),
            product_price: LookupMap::new(b"productPrice".to_vec()),
            product_names: Vector::new(b"productNames".to_vec()),
            sold_price: Vector::new(b"soldPrice".to_vec()),
            sold_item: LookupMap::new(b"soldItems".to_vec()),
            sold_name: Vector::new(b"salename".to_vec()),
            owned_items: LookupMap::new(b"owned".to_vec()),
            products_by_owner: LookupMap::new(b"pbo".to_vec()),
            artist_list: UnorderedSet::new(b"artistlist".to_vec()),
            owner_of_token: LookupMap::new(b"ownerofToken".to_vec()),
        };

        //return the Contract object
        this
    }

    pub fn add_product(&mut self, product_name: String, url: String, price: String) {
        let user = env::signer_account_id();
        self.product_list.insert(&product_name, &url);
        self.product_names.push(&product_name);
        self.product_price.insert(&product_name, &price);
        self.add_to_artist_list();
        self.owner_of_token.insert(&product_name, &user);
    }

    pub fn get_product(&self, name: String) -> String {
        self.product_list.get(&name).unwrap_or("".to_string())
    }

    pub fn get_product_list_len(&self) -> u64 {
        self.product_names.len()
    }

    pub fn get_product_price(&self, name: String) -> String {
        self.product_price
            .get(&name)
            .unwrap_or("no price given".to_string())
    }

    pub fn get_product_list_item(&self, num: u64) -> String {
        self.product_names.get(num).unwrap_or("0".to_string())
    }

    pub fn get_name_vector(&self) -> Vec<String> {
        let mut result_vec = vec![];
        for i in self.product_names.iter() {
            result_vec.push(i);
        }
        result_vec
    }

    pub fn add_product_to_owner(&mut self, name: String) {
        let user = env::signer_account_id();
        let mut current_vec: Vec<String> = self.products_by_owner.get(&user).unwrap_or(vec![]);
        current_vec.push(name.to_string());

        self.products_by_owner.insert(&user, &current_vec);
    }

    pub fn add_to_artist_list(&mut self) {
        let user = env::signer_account_id();
        if self.artist_list.contains(&user) {
            println!("user exists already")
        } else {
            self.artist_list.insert(&user);
        }
    }

    pub fn get_artist_list(&self) -> Vec<AccountId> {
        let mut result_vec = vec![];
        for i in self.artist_list.iter() {
            result_vec.push(i);
        }
        result_vec
    }

    pub fn get_product_by_owner(&self, name: AccountId) -> Vec<String> {
        self.products_by_owner.get(&name).unwrap_or(vec![])
    }

    pub fn get_token_owner(&self, token_id: TokenId) -> AccountId {
        self.owner_of_token.get(&token_id).unwrap()
    }

    #[payable]
    pub fn remove_item(&mut self, name: String, price: String, index: u64, owner: AccountId) {
        let prev_owner = self.owner_of_token.get(&name).unwrap();
        let priceu128: u128 = price.parse().unwrap();
        Promise::new(prev_owner).transfer(priceu128);

        let receiver = env::signer_account_id();
        self.sold_price.push(&price);
        self.sold_name.push(&name);

        self.product_price.remove(&name);
        self.add_product_to_owner(name);
        self.product_names.swap_remove(index);

        // crate::mint::nft_mint(
        //     token_id: TokenId,
        //     metadata: TokenMetadata,
        //     receiver_id: AccountId,
        // )
    }
}
