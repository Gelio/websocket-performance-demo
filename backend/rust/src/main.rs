use std::{
    env,
    path::{Path, PathBuf},
};

use actix_files::NamedFile;
use actix_web::{guard, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;

mod demo_ws;

async fn handle_ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    ws::start(demo_ws::WebSocketActor::default(), &req, stream)
}

async fn index(req: HttpRequest) -> Result<NamedFile, Error> {
    let mut path: PathBuf = req.match_info().query("filename").parse().unwrap();
    if path == Path::new("") {
        path = path.join("index.html");
    }
    let path = PathBuf::from("../../frontend").join(path);
    Ok(NamedFile::open(path)?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = env::var("PORT")
        .map(|port| port.parse::<u32>().expect("Invalid PORT env variable"))
        .unwrap_or(3000);

    let addr = format!("127.0.0.1:{}", port);

    let server = HttpServer::new(|| {
        App::new()
            .route(
                "/",
                web::get()
                    .guard(guard::Header("Upgrade", "websocket"))
                    .to(handle_ws),
            )
            .route("/{filename:.*}", web::get().to(index))
    })
    .bind(&addr)?;

    println!("Listening on {}", addr);

    server.run().await
}
