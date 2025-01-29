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
pub async fn voting_on(state: web::Data<State>) -> impl Responder {
    state.contract.voting_on().send().await.expect("error when calling voting_on");
    HttpResponse::Ok().finish()
}

#[get("/voting_off")]
pub async fn voting_off(state: web::Data<State>) -> impl Responder {
    state.contract.voting_off().send().await.expect("error when calling voting_on");
    HttpResponse::Ok().finish()
}