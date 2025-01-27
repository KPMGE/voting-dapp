use actix_web::{get, post, web, HttpResponse, Responder};
use ethers::{contract::Contract, providers::{Http, Provider}};
use serde::Deserialize;

use ethers::prelude::*;

use crate::State;

#[derive(Deserialize)]
struct IssueTokenBody {
    account_code: String,
    amount: u64
}

#[post("/issue_token")]
pub async fn issue_token(state: web::Data<State>, data: web::Json<IssueTokenBody>) -> impl Responder {
    println!("{}", data.account_code);
    println!("{}", data.amount);

    let amount = U256::from(data.amount);
    let code = data.account_code.clone();
    state.contract.issue_token(code, amount).send().await.expect("error when calling issue token");

    HttpResponse::Ok().finish()
}

#[get("/vote")]
pub async fn vote() -> impl Responder {
    HttpResponse::Ok().finish()
}

#[get("/voting_on")]
pub async fn voting_on() -> impl Responder {
    HttpResponse::Ok().finish()
}

#[get("/voting_off")]
pub async fn voting_off() -> impl Responder {
    HttpResponse::Ok().finish()
}