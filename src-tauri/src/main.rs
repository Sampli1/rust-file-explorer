// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


mod explorer;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            explorer::file_explorer::list_folders,
            explorer::file_explorer::find,
            explorer::file_explorer::create_folder
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
