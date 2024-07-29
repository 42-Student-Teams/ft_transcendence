import Component from "../../library/component.js";
import store from '../../store/index.js';

export default class LanguageSelector extends Component {
  constructor() {
    super({ element: document.getElementById("languageSelector") });
    store.events.subscribe("stateChange", () => this.render());
  }

  render() {
    const languageId = store.state.languageId;
    this.element.innerHTML = /*html*/ `
      <select id="language-selector" class="form-select mb-3">
        <option value="fr" ${languageId === 'fr' ? 'selected' : ''}>Français</option>
        <option value="en" ${languageId === 'en' ? 'selected' : ''}>English</option>
        <option value="es" ${languageId === 'es' ? 'selected' : ''}>Español</option>
      </select>
    `;
    this.attachEventListeners();
  }

  attachEventListeners() {
    const selector = this.element.querySelector('#language-selector');
    selector.addEventListener('change', (e) => {
      store.dispatch('setLanguage', { languageId: e.target.value });
    });
  }
}