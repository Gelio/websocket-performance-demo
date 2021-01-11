use std::{ops::RangeInclusive, time::Duration};

use actix::{Actor, AsyncContext, StreamHandler};
use actix_web_actors::ws;
use serde::{Deserialize, Serialize};

const MESSAGES_PER_MINUTE: u64 = 60_000;
const TABLE_VALUES_RANGE: RangeInclusive<i32> = 0..=100;

#[derive(Serialize, Deserialize, Debug)]
struct TableSize {
    width: usize,
    height: usize,
}

#[derive(Serialize, Deserialize, Debug)]
struct TableUpdateData {
    row: usize,
    column: usize,
    value: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
enum OutgoingMessage {
    #[serde(rename = "table update", rename_all = "camelCase")]
    TableUpdateMessage { update_data: TableUpdateData },
}

impl OutgoingMessage {
    fn get_random_rable_update<T: rand::Rng>(r: &mut T, s: &TableSize) -> Self {
        Self::TableUpdateMessage {
            update_data: TableUpdateData {
                row: r.gen_range(0..s.height),
                column: r.gen_range(0..s.width),
                value: r.gen_range(TABLE_VALUES_RANGE),
            },
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
enum IncomingMessage {
    #[serde(rename = "ready", rename_all = "camelCase")]
    ReadyMessage { table_size: TableSize },
}

pub struct WebSocketActor {
    initialized: bool,
    rng: rand::rngs::ThreadRng,
}

impl Default for WebSocketActor {
    fn default() -> Self {
        Self {
            initialized: false,
            rng: rand::thread_rng(),
        }
    }
}

impl Actor for WebSocketActor {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, _: &mut Self::Context) {
        println!("A client connected");
    }

    fn stopped(&mut self, _: &mut Self::Context) {
        println!("A client disconnected");
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WebSocketActor {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                let message: IncomingMessage =
                    serde_json::from_str(&text).unwrap_or_else(|error| {
                        panic!(
                            "Invalid or unexpected message received: {:?}, {}",
                            text, error
                        );
                    });

                match message {
                    IncomingMessage::ReadyMessage { table_size } => {
                        if self.initialized {
                            println!("Duplicate ready message received");
                            return;
                        }

                        self.initialized = true;

                        ctx.run_interval(
                            Duration::from_micros(60_000_000 / MESSAGES_PER_MINUTE),
                            move |actor, ctx| {
                                let message = OutgoingMessage::get_random_rable_update(
                                    &mut actor.rng,
                                    &table_size,
                                );
                                let serialized_message = serde_json::to_string(&message)
                                    .expect("Could not serialize table update message");

                                ctx.text(serialized_message);
                            },
                        );
                    }
                };
            }
            Ok(ws::Message::Close(_)) => {}
            _ => {
                println!("Unexepcted message type received: {:?}", msg);
            }
        };
    }
}
