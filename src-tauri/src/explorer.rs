pub mod file_explorer {
    use std::{fs::{self, ReadDir}, path::PathBuf};
    use std::sync::{Arc, Mutex};
    use rayon::prelude::*;
    use serde::Serialize;
    

    #[derive(Serialize, Debug)]
    pub struct DirContent {
        name: String,
        extension: String,
        path: Vec<String>
    }


    #[tauri::command]
    pub fn list_folders(path: Vec<&str>) -> Result<Vec<DirContent>, String> {
        let mut path_buf = PathBuf::new();
        for piece in path {
            path_buf.push(piece);
        }
        
        let dir_entries = fs::read_dir(&path_buf)
            .map_err(|e| e.to_string())?;
        
        let contents: Result<Vec<DirContent>, String> = dir_entries
            .map(|entry| {
                let entry = entry.map_err(|e| e.to_string())?;
                let name = entry.file_name().to_string_lossy().into_owned();
                let extension = entry.path()
                    .extension()
                    .map(|ext| ext.to_string_lossy().into_owned())
                    .unwrap_or_default();
                let path_file = entry.path()
                    .iter()
                    .map(|el| el.to_string_lossy().into_owned())
                    .collect();
                


                Ok(DirContent { name, extension, path: path_file})
            })
            .collect();
        
        contents
    }

    fn get_dir_entries(base_path: &Vec<String>) -> Result<ReadDir, String> {
        let mut path_buf = PathBuf::new();
        
        for piece in base_path {
            path_buf.push(piece);
        };

        let dir_entries = fs::read_dir(&path_buf)
            .map_err(|e| e.to_string())?;
    
        Ok(dir_entries)

    }

    fn find_r(entries: Vec<std::fs::DirEntry>,name: Arc<String>, results: Arc<Mutex<Vec<DirContent>>>, base_path: Vec<String> ) {
        entries.into_par_iter().for_each(|entry| {
            let name_entry = entry.file_name().to_string_lossy().into_owned();
            let extension = entry
                .path()
                .extension()
                .map(|ext| ext.to_string_lossy().into_owned())
                .unwrap_or_default();

            let path_file: Vec<String> = entry.path()
                .iter()
                .map(|el| el.to_string_lossy().into_owned())
                .collect();

            if name_entry.contains(name.as_str()) {
                let mut results = results.lock().unwrap();
                results.push(DirContent {
                    name: name_entry.clone(),
                    extension: extension.clone(),
                    path: path_file,
                });
            }
            println!("{:?}", name_entry);

            if extension.is_empty() {
                let mut new_path = base_path.clone();
                new_path.push(name_entry.clone());
                if let Ok(new_dir_entries) = get_dir_entries(&new_path) {
                    let new_entries: Vec<std::fs::DirEntry> = new_dir_entries.filter_map(Result::ok).collect();
                    let results_clone = Arc::clone(&results);
                    let name_clone = Arc::clone(&name);
                    find_r(new_entries, name_clone, results_clone, new_path);
                }
            }
        });
    }


    #[tauri::command]
    pub fn find(base_path: Vec<String>, name: String) -> Result<Vec<DirContent>, String> {
        let results: Arc<Mutex<Vec<DirContent>>> = Arc::new(Mutex::new(vec![]));
        let dir_entries = get_dir_entries(&base_path)?;

        let entries: Vec<std::fs::DirEntry> = dir_entries.filter_map(Result::ok).collect();

        let results_clone = Arc::clone(&results);
        let name_clone = Arc::new(name);
        find_r(entries, name_clone, results_clone, base_path);

        let results = Arc::try_unwrap(results)
            .map_err(|_| "Err".to_string())?
            .into_inner()
            .map_err(|_| "Err".to_string())?;

        Ok(results)
    }


    #[tauri::command]
    pub fn create_folder(base_path: Vec<String>, name: String) -> Result<DirContent, String>{
        let mut path_buf = PathBuf::new();
        
        for piece in base_path {
            path_buf.push(piece);
        };
        path_buf.push(name.clone());

        fs::create_dir(path_buf.clone())
            .map_err(|e| e.to_string())?;
        
        let path_file: Vec<String> = path_buf
            .into_iter()
            .map(|el| el.to_string_lossy().into_owned())
            .collect();
        
        Ok(
            DirContent {
                name: name,
                extension: String::from(""),
                path: path_file
            }
        )
    }

}

