use ethers::prelude::*;
use ethers::providers::{Provider, Http};
use std::sync::Arc;
use dotenv::dotenv;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let contract_address = env::var("CONTRACT_ADDRESS")
        .expect("CONTRACT_ADDRESS must be set")
        .parse::<Address>()?;

    let rpc_address = env::var("RPC_ADDRESS").expect("RPC_ADDRESS must be set");
    let account_private_key = env::var("ACCOUNT_PRIVATE_KEY").expect("ACCOUNT_PRIVATE_KEY must be set");

    abigen!(IERC721, "./MyContract.json");

    let rpc_url = format!("{}/{}", rpc_address, account_private_key);
    let provider = Provider::<Http>::try_from(rpc_url.as_str())?;
    let provider = Arc::new(provider);
    let contract = IERC721::new(contract_address, provider.clone());

    let function_name = "message";
    let function_params = ();
    let result: String = contract.method(function_name, function_params)?.call().await?;
    println!("{}", result);
    Ok(())
}