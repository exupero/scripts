class EditableList extends HTMLElement {
  connectedCallback() {
    this._itemTemplate = this.querySelector('template');

    if (!this._itemTemplate) {
      const observer = new MutationObserver(() => {
        this._itemTemplate = this.querySelector('template');
        if (this._itemTemplate) {
          observer.disconnect();
        }
      })
      observer.observe(this, {childList: true});
    }

    this._list = document.createElement('ol');

    this._addButton = document.createElement('button');
    this._addButton.type = 'button';
    this._addButton.textContent = '+';
    this._addButton.addEventListener('click', () => this._addItem());

    this.append(this._list, this._addButton);
  }

  disconnectedCallback() {
    this._addButton.removeEventListener('click', () => this._addItem());
  }

  get items() {
    return Array.from(this._list.querySelectorAll('.editable-list-item > :first-child'));
  }

  addItem(node) {
    const wrapper = document.createElement('li');
    wrapper.className = 'editable-list-item';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => this._removeItem(wrapper));

    wrapper.append(node, removeButton);
    this._list.appendChild(wrapper);

    this.dispatchEvent(new CustomEvent('item-added', {
      bubbles: true,
      composed: true,
      detail: {item: node},
    }));

    return node;
  }

  removeItem(node) {
    const wrapper = node.closest('.editable-list-item');
    if (wrapper) this._removeItem(wrapper);
  }

  _addItem() {
    if (this._itemTemplate) {
      this.addItem(this._itemTemplate.content.cloneNode(true).firstElementChild);
    } else {
      this.dispatchEvent(new CustomEvent('create-item', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }));
    }
  }

  _removeItem(wrapper) {
    const item = wrapper.querySelector(':first-child');
    wrapper.remove();

    this.dispatchEvent(new CustomEvent('item-removed', {
      bubbles: true,
      composed: true,
      detail: {item},
    }));
  }
}

customElements.define('editable-list', EditableList);
