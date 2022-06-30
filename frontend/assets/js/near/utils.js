import {
  connect,
  Contract,
  keyStores,
  WalletConnection,
  Account,
  utils,
} from "near-api-js";
import getConfig from "./config";

const nearConfig = getConfig("development");

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );
  console.log(nearConfig);

  console.log(nearConfig.contractName);
  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  window.utils = utils;

  window.account = new Account(near, window.accountId);
  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        "get_greeting",
        "get_product",
        "get_product_list_len",
        "get_product_list_item",
        "get_name_vector",
        "get_product_price",
        "check_token",
        "get_product_by_owner",
        "get_artist_list",
        "get_token_owner",
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
        "set_greeting",
        "add_product",
        "remove_item",
        "nft_mint",
        "add_product_to_owner",
        "add_to_artist_list",
      ],
    }
  );
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName);
}

export async function set_greeting(message) {
  let response = await window.contract.set_greeting({
    args: { message: message },
  });
  return response;
}

export async function get_greeting() {
  let greeting = await window.contract.get_greeting();
  return greeting;
}
