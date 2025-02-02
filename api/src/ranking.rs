use std::collections::HashMap;

#[derive(Debug)]
pub struct Ranking {
    votes: HashMap<String, u128>,
}

impl Ranking {
    pub fn new() -> Self {
        Ranking {
            votes: HashMap::new(),
        }
    }

    pub fn add_vote(&mut self, name: String, amount: u128) {
        let entry = self.votes.entry(name).or_insert(0);
        *entry += amount;
    }

    pub fn get_ranking(&self) -> Vec<(String, u128)> {
        let mut sorted: Vec<(String, u128)> = self.votes.iter().map(|(k, &v)| (k.clone(), v)).collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1)); // Sort by amount descending
        sorted
    }
}