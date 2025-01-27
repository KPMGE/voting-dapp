mod services;
use dotenv::dotenv;
use ethers::prelude::*;
use ethers::providers::{Provider, Http};
use std::sync::Arc;
use std::env;

use actix_web::{App, HttpServer};

abigen!(Turing, "../blockchain/artifacts/contracts/Turing.sol/Turing.json");

#[derive(Debug, Clone)]
pub struct State {
    contract: turing::Turing<Provider<Http>>
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let contract_address = env::var("CONTRACT_ADDRESS")
        .expect("CONTRACT_ADDRESS must be set")
        .parse::<Address>()
        .expect("Cannot parse contract address");

    let rpc_address = env::var("RPC_ADDRESS").expect("RPC_ADDRESS must be set");
    let account_private_key = env::var("ACCOUNT_PRIVATE_KEY").expect("ACCOUNT_PRIVATE_KEY must be set");


    let rpc_url = format!("{}/{}", rpc_address, account_private_key);
    let provider = Provider::<Http>::try_from(rpc_url.as_str())
        .expect("Cannot create RPC provider");
    let provider = Arc::new(provider);
    let contract = Turing::new(contract_address, provider.clone());
    let state = actix_web::web::Data::new(State {
        contract
    });

    HttpServer::new(move || {
        App::new()
            .service(services::issue_token)
            .service(services::vote)
            .service(services::voting_on)
            .service(services::voting_off)
            .app_data(state.clone())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}