use ethers::prelude::*;
use ethers::providers::{Provider, Http};
use std::sync::Arc;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let contract_address = "0x5fbdb2315678afecb367f032d93f642f64180aa3".parse::<Address>()?;
    abigen!(IERC721, "./MyContract.json");
    let rpc_url = format!("http://127.0.0.1:8545/{}", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    let provider = Provider::<Http>::try_from(rpc_url.as_str())?;
    let provider = Arc::new(provider);
    let contract = IERC721::new(contract_address, provider.clone());

    let function_name = "message";
    let function_params = ();
    let result: String = contract.method(function_name, function_params)?.call().await?;
    println!("{}", result);
    Ok(())
}