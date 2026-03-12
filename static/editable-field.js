class EditableField extends HTMLElement {
  static get observedAttributes() { return ['placeholder', 'focused']; }

  constructor() {
    super();
    this._value = '';
    this._showingPlaceholder = false;
    this._internalFocusChange = false;
    this.contentEditable = 'true';
    this.spellcheck = false;
  }

  connectedCallback() {
    this._renderPlaceholder();
    this.addEventListener('focus',   this._onFocus);
    this.addEventListener('blur',    this._onBlur);
    this.addEventListener('input',   this._onInput);
    this.addEventListener('keydown', this._onKeydown);
    this.addEventListener('paste',   this._onPaste);
    if (this.hasAttribute('focused')) { requestAnimationFrame(() => this.focus()); }
  }

  disconnectedCallback() {
    this.removeEventListener('focus',   this._onFocus);
    this.removeEventListener('blur',    this._onBlur);
    this.removeEventListener('input',   this._onInput);
    this.removeEventListener('keydown', this._onKeydown);
    this.removeEventListener('paste',   this._onPaste);
  }

  attributeChangedCallback(name, _old, next) {
    if (name === 'placeholder' && this._showingPlaceholder) {
      this.innerText = next ?? '';
      return;
    }

    if (name === 'focused') {
      // Avoid reacting to attribute changes we ourselves made
      if (this._internalFocusChange) return;

      if (next !== null) {
        // Attribute was added — focus the field
        requestAnimationFrame(() => this.focus());
      } else {
        // Attribute was removed — blur the field
        requestAnimationFrame(() => this.blur());
      }
    }
  }

  get value() { return this._value; }
  set value(v) {
    const str = v == null ? '' : String(v);
    this._value = str;
    this._showingPlaceholder = false;

    if (str === '') {
      this._renderPlaceholder();
    } else {
      this.innerText = str;
    }

    this._reflectEmptyAttr();
  }

  _renderPlaceholder() {
    const placeholder = this.getAttribute('placeholder') ?? '';
    this.innerText = placeholder;
    this._showingPlaceholder = placeholder.length > 0;
    this._reflectEmptyAttr();
  }

  _reflectEmptyAttr() {
    if (this._value === '') {
      this.setAttribute('empty', '');
    } else {
      this.removeAttribute('empty');
    }
  }

  _onFocus = () => {
    if (this._showingPlaceholder) {
      this.innerText = '';
      this._showingPlaceholder = false;
    }
    this._internalFocusChange = true;
    this.setAttribute('focused', '');
    this._internalFocusChange = false;
  };

  _onBlur = () => {
    const text = this.innerText.trim();
    this._value = text;

    if (text === '') {
      this._renderPlaceholder();
    }

    this._internalFocusChange = true;
    this.removeAttribute('focused');
    this._internalFocusChange = false;

    this._reflectEmptyAttr();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: this._value }
    }));
  };

  _onInput = () => {
    if (this._showingPlaceholder) return;

    this._value = this.innerText;
    this._reflectEmptyAttr();

    this.dispatchEvent(new CustomEvent('input', {
      bubbles: true,
      composed: true,
      detail: { value: this._value }
    }));
  };

  _onKeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.blur();
    }
  };

  _onPaste = (e) => {
    e.preventDefault();
    const plain = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, plain);
  };
}

customElements.define('editable-field', EditableField);
