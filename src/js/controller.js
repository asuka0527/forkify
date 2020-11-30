//import from model
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';

import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

// install POLYFILLING
// @ terminal npm i core-js regenerator-runtime
import 'core-js/stable';
import 'regenerator-runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

// --------------------------------- FUNCTIONS

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// Rendering Spinner Function

// Make async function
const controlRecipe = async function () {
  try {
    // Get hash value from window -> id value
    const id = window.location.hash.slice(1);
    // console.log(id);

    // Guard Clause
    if (!id) return;

    // Render spinner
    recipeView.renderspinner();

    // 0). Update results view to mark selected search result
    resultView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2). Loading recipe - 1 async function calling another 1 async function
    await model.loadRecipe(id);

    // 3). Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // alert(err);
    recipeView.renderError();
    console.error(err);
  }
};

// controlRecipe();

const controlSearchResults = async function () {
  try {
    resultView.renderspinner();

    // 1). Get search query
    const query = searchView.getQuery();

    // 2). Load search results
    await model.loadSearchResults(query);

    // 3). Render results
    resultView.render(model.getSearchResultsPage(1));
    // resultView.render(model.state.search.results);

    // 4). Render Initial Pagination Buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goTopage) {
  console.log(goTopage);

  // 1). Render NEW results
  resultView.render(model.getSearchResultsPage(goTopage));
  // resultView.render(model.state.search.results);

  // 2). Render NEW Pagination Buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servins (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1). Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2). Update recipe view
  console.log(model.state.recipe);
  recipeView.update(model.state.recipe);

  // 3).
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderspinner();

    // Upload new recipe data}
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in the URL
    // changes the Url of the page -> pushState(current state,title,URL)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Going back to last page automatically
    // window.history.back()

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow(), MODAL_CLOSE_SEC * 1000;
    });
    //
  } catch (err) {
    console.error('😭', err);
    addRecipeView.renderError(err.message);
  }
};

// controlSearchResults();
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};

init();

// // Triggers any hash change / loading of page
// ['hashchange', 'load'].forEach(ev =>
//   window.addEventListener(ev, controlRecipe)
// );
// // window.addEventListener('hashchange', controlRecipe);
// // window.addEventListener('load', controlRecipe);

// Debugger
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarks();
