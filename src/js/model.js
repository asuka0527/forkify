import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';
// --------------------------------- FUNCTION & DATA

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },

  bookmarks: [],
};

// Uploaded Recipe from API-> Convert it to our format again-> Create Object
const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,

    // Conditional way of adding properties to object
    // (shortcircuits if key doesnt exist nothing will happen && if it does exist spread the object to format it the same way
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    // Formatted API -> state.recipe FORMAT
    state.recipe = createRecipeObject(data);

    // // 1). Loading recipe
    // // reformating the object's property names <- bec there are unwanted underscores in the property names that should be formatted to camelCase
    // let { recipe } = data.data;

    // state.recipe = {
    //   id: recipe.id,
    //   title: recipe.title,
    //   publisher: recipe.publisher,
    //   sourceUrl: recipe.source_url,
    //   image: recipe.image_url,
    //   servings: recipe.servings,
    //   cookingTime: recipe.cooking_time,
    //   ingredients: recipe.ingredients,
    // };

    // Adding the bookmarked logic
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else state.recipe.bookmarked = false;

    // console.log(state.recipe);
  } catch (err) {
    // Temp error handling
    // console.error(`${err} 😭 😭 😭`);

    // throw err -> to be able to use it in the controller
    throw err;
  }
};

// Storing Bookmarks on LocalStorage
const persistBookmarks = function () {
  // Store in Local storage
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&?key=${KEY}`);
    // console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
    // console.log(state.search.results);
  } catch (err) {
    console.error(`${err} 😭 😭 😭`);

    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0
  const end = page * state.search.resultsPerPage; // 9

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newQt / oldServings // 2 * 8 / 4  = 4
  });

  state.recipe.servings = newServings;
};

export const addBookmark = function (recipe) {
  //add bookmarks
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarks
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete Bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

//Taking out the bookmarks from local storage
const init = function () {
  // extracting from local storage and covenverting it aagain
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
};

init();
console.log(state.bookmarks);

// Upload Recipe
export const uploadRecipe = async function (newRecipe) {
  try {
    // console.log(Object.entries(newRecipe));

    // create new array from an OBJECT
    const ingredients = Object.entries(newRecipe)

      //.filter ( key, value)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw Error('Wrong ingredient format! please use the correct format');

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    console.log(ingredients);

    // Should be formatted the same way we receive recipe from our API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    console.log(recipe);

    //Sending recipe back to us
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);

    // Add bookmark to our recipe
    addBookmark(state.recipe);
    console.log(data);
  } catch (err) {
    throw err;
  }
};
