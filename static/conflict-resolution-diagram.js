const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(160px, 1fr) 56px minmax(80px, 0.5fr) minmax(80px, 0.5fr) 56px minmax(160px, 1fr);
  grid-template-rows: auto auto auto auto auto;
  grid-template-areas:
    "a b b b c c c"
    "d e f g g h i"
    "d q r s t u i"
    "d j k l l m i"
    "n o o o p p p";
}

.assumptions-req1        { grid-area: b; }
.assumptions-obj1        { grid-area: c; }
.assumptions-conflict    { grid-area: d; }
.req1                    { grid-area: e; }
.objective-requirement-1 { grid-area: f; }
.obj1                    { grid-area: g; }
.goal-objective-1        { grid-area: h; }
.goal                    { grid-area: i; }

.conflict                { grid-area: q; }

.req2                    { grid-area: j; }
.objective-requirement-2 { grid-area: k; }
.obj2                    { grid-area: l; }
.goal-objective-2        { grid-area: m; }
.assumptions-req2        { grid-area: o; }
.assumptions-obj2        { grid-area: p; }

.editable-list-item {
}

.assumption {
  .field[empty], .invalidation[empty] {
    color: #aaa;
    font-style: italic;
  }
}

.invalidation {
  display: flex;
}

.assumptions {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}
.assumptions--middle { align-self: center; }
.assumptions--bottom { align-self: end; }
.assumptions--top    { align-self: start; }

.box {
  display: flex;
  border: 1px solid #ccc;
  align-self: stretch;
  flex-direction: column;
  justify-content: center;
  padding: 0.5rem;
  text-align: center;
}

.connector {
  display: flex;
  align-self: center;
  justify-content: center;
  text-align: center;
}
</style>

<template class="assumption-template">
  <div class="assumption">
    <editable-field class="field" placeholder="Assumption"></editable-field>
    <editable-list class="invalidations">
      <template>
        <editable-field class="invalidation" placeholder="Invalidation"></editable-field>
      </template>
    </editable-list>
  </div>
</template>

<editable-field class="box req1"></editable-field>
<editable-field class="box req2"></editable-field>
<editable-field class="box obj1"></editable-field>
<editable-field class="box obj2"></editable-field>
<editable-field class="box goal"></editable-field>

<editable-list class="assumptions assumptions--middle assumptions-conflict"></editable-list>
<editable-list class="assumptions assumptions--bottom assumptions-req1"></editable-list>
<editable-list class="assumptions assumptions--top assumptions-req2"></editable-list>
<editable-list class="assumptions assumptions--bottom assumptions-obj1"></editable-list>
<editable-list class="assumptions assumptions--top assumptions-obj2"></editable-list>

<div class="connector conflict">|</div>
<div class="connector objective-requirement-1">&larr;</div>
<div class="connector objective-requirement-2">&larr;</div>
<div class="connector goal-objective-1">&larr;</div>
<div class="connector goal-objective-2">&larr;</div>
`;

class ConflictResolutionDiagram extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    await Promise.all([
      customElements.whenDefined('editable-field'),
      customElements.whenDefined('editable-list'),
    ]);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._populate(await this._readData());
  }

  async _readData() {
    const scriptEl = this.querySelector('script[type="application/json"]');
    if (scriptEl) {
      return this._parseData(scriptEl.textContent);
    }

    return new Promise(resolve => {
      const observer = new MutationObserver(() => {
        const scriptEl = this.querySelector('script[type="application/json"]');
        if (scriptEl) {
          observer.disconnect();
          resolve(this._parseData(scriptEl.textContent));
        }
      })
      observer.observe(this, {childList: true});
    })
  }

  _parseData(data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse JSON data:', e);
    }
  }

  _initAssumptions(listEl, items) {
    const template = this.shadowRoot.querySelector('.assumption-template');
    items.forEach(item => {
      const assumption = template.content.cloneNode(true);
      // These steps have to be in this order, with the field selected before
      // being added to the list, then the value set after being added to the
      // list.
      const field = assumption.querySelector('.field');
      listEl.addItem(assumption);
      field.value = item;
    });
    listEl.addEventListener('create-item', e => {
      listEl.addItem(template.content.cloneNode(true));
    });
  }

  _populate(data) {
    const root = this.shadowRoot;

    root.querySelector('.req1').value = data.req1 || '';
    root.querySelector('.req2').value = data.req2 || '';
    root.querySelector('.obj1').value = data.obj1 || '';
    root.querySelector('.obj2').value = data.obj2 || '';
    root.querySelector('.goal').value = data.goal || '';

    this._initAssumptions(root.querySelector('.assumptions-conflict'), data.assumptions.conflict || []);
    this._initAssumptions(root.querySelector('.assumptions-req1'), data.assumptions.req1 || []);
    this._initAssumptions(root.querySelector('.assumptions-req2'), data.assumptions.req2 || []);
    this._initAssumptions(root.querySelector('.assumptions-obj1'), data.assumptions.obj1 || []);
    this._initAssumptions(root.querySelector('.assumptions-obj2'), data.assumptions.obj2 || []);
  }
}

customElements.define('conflict-resolution-diagram', ConflictResolutionDiagram);
