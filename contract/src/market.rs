use crate::*;


#[near_bindgen]
impl Contract {
    // Public method - returns the greeting saved, defaulting to DEFAULT_MESSAGE
    pub fn get_greeting(&self) -> String {
        return self.message.clone();
    }

    // Public method - accepts a greeting, such as "howdy", and records it
    pub fn set_greeting(&mut self, message: String) {
        // Use env::log to record logs permanently to the blockchain!
        log!("Saving greeting {}", message);
        self.message = message;
    }

    pub fn add_product(&mut self,product_name:String,url:String,price:String){
        self.product_list.insert(&product_name,&url);
        self.product_names.push(&product_name);
        self.product_price.insert(&product_name,&price);
    }

    pub fn get_product(&self,name:String)->String{
        self.product_list.get(&name).unwrap()
    }

    pub fn get_product_list_len(&self)->u64{
        self.product_names.len()
    }

    pub fn get_product_price(&self, name:String)->String{
        self.product_price.get(&name).unwrap()
    }

    pub fn get_product_list_item(&self,num:u64)->String{
        self.product_names.get(num).unwrap()
    }

    pub fn get_vector(&self)->Vec<String>{
        let mut result_vec=vec![];
       for i in self.product_names.iter() {
        result_vec.push(i);
       }
       result_vec
    }
}