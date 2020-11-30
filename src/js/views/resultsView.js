import View from './View.js';
import previewView from './previewView.js';

class ResultView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'We could not find that query. Please try again! :)';

  _generateMarkup() {
    return this._data
      .map(results => previewView.render(results, false))
      .join('');
  }

  // _generateMarkup() {
  //   return this._data.map(this._generateMarkupPreview);
  // }

  // _generateMarkupPreview(result) {
  //   const id = window.location.hash.slice(1);

  //   return `<li class="preview">
  //   <a class="preview__link ${
  //     result.id === id ? 'preview__link--active' : ''
  //   } " href="#${result.0id}">
  //     <figure class="preview__fig">
  //       <img src="${result.image}" alt="${result.title}" />
  //     </figure>
  //     <div class="preview__data">
  //       <h4 class="preview__title">${result.title}</h4>
  //       <p class="preview__publisher">${result.publisher}</p>
  //     </div>
  //   </a>
  //   </li>`;
  // }
}

export default new ResultView();
