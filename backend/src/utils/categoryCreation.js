import { readdirSync } from 'fs';
import { basename, join } from 'path';

async function createCategoriesFromFolders(rootPath, Category) {
  try {
    // Get all leaf folders (folders with no subfolders)
    const leafFolders = getLeafFolders(rootPath);

    // Create MongoDB entries for each leaf folder
    const categoryPromises = leafFolders.map(async (folderName) => {
      try {
        const category = await Category.create({ name: folderName });
        console.log(`Created category: ${folderName}`);
        return category;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Category '${folderName}' already exists, skipping...`);
          return null;
        }
        throw error;
      }
    });

    const results = await Promise.all(categoryPromises);
    const createdCategories = results.filter(cat => cat !== null);

    console.log(`Successfully created ${createdCategories.length} categories`);
    return createdCategories;

  } catch (error) {
    console.error('Error creating categories:', error);
    throw error;
  }
}

function getLeafFolders(rootPath) {
  const leafFolders = [];

  function traverse(currentPath) {
    try {
      const items = readdirSync(currentPath, { withFileTypes: true });
      const folders = items.filter(item => item.isDirectory());

      if (folders.length === 0) {
        // This is a leaf folder (no subfolders)
        const folderName = basename(currentPath);
        leafFolders.push(folderName);
      } else {
        // Traverse subfolders
        folders.forEach(folder => {
          const folderPath = join(currentPath, folder.name);
          traverse(folderPath);
        });
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
    }
  }

  traverse(rootPath);
  return leafFolders;
}

// Alternative version if you have an array of paths instead of scanning filesystem
function createCategoriesFromPaths(filePaths, Category, weddingId) {
  // Extract unique folder names from file paths
  const folderNames = [...new Set(filePaths.map(filePath => {
    const parts = filePath.split('/');
    parts.pop(); // Remove filename
    return parts[parts.length - 1]; // Get last folder name
  }))];

  return createCategoriesFromFolderNames(folderNames, Category, weddingId);
}

async function createCategoriesFromFolderNames(folderNames, Category, weddingId) {
  try {
    const categoryPromises = folderNames.map(async (folderName) => {
      try {
        const category = await Category.findOneAndUpdate(
          { weddingId: weddingId, title: folderName },
          { $setOnInsert: { weddingId: weddingId, title: folderName, unlockThreshhold: 50 } },
          { upsert: true, new: true }
        );
        console.log(`Created category: ${folderName}`);
        return category;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`Category '${folderName}' already exists, skipping...`);
          return null;
        }
        throw error;
      }
    });

    const results = await Promise.all(categoryPromises);
    const createdCategories = results.filter(cat => cat !== null);

    console.log(`Successfully created ${createdCategories.length} categories`);
    return createdCategories;

  } catch (error) {
    console.error('Error creating categories:', error);
    throw error;
  }
}

// Usage examples:

// Example 1: Scan filesystem for leaf folders
// createCategoriesFromFolders('./root', Category);

// Example 2: From array of file paths
// const filePaths = [
//   'root/path1/path2/file.exe',
//   'root/path1/path3/x.txt', 
//   'root/path1/path2/path4/y.txt',
//   'root/path6/something.jsx'
// ];
// createCategoriesFromPaths(filePaths, Category);

// Example 3: From array of folder names directly
// const folderNames = ['fold1', 'fold2', 'fold3'];
// createCategoriesFromFolderNames(folderNames, Category);

export {
  createCategoriesFromFolders,
  createCategoriesFromPaths,
  createCategoriesFromFolderNames,
  getLeafFolders
};