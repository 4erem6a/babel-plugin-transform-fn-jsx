# babel-plugin-transform-fn-jsx

Transforms JSX into js function calls.

## Examples

### Elements

```jsx
<text>2 + 2 = {2 + 2}</text>
```

is

```js
text({}, ["2 + 2 = ", 2 + 2]);
```

### Namespaces

```jsx
<ns:element>
  <ns:another />
</ns:element>
```

is

```js
ns("element", {}, [ns("another", {}, [])]);
```

### Fragments

```jsx
<>
  <element />
  <element />
  <element />
</>
```

is

```js
[element({}, []), element({}, []), element({}, [])];
```

## Options

`removeEmptyText: boolean` (default: true)  
Removes blank and empty JSXText elements.

Example:

```jsx
// JSX
(
  <>
    <element />
    <element />
    <element />
  </>
)[
  // Compiled JS
  // removeEmptyText: true
  (element({}, []), element({}, []), element({}, []))
][
  // removeEmptyText: false
  ("\n\t",
  element({}, []),
  "\n\t",
  element({}, []),
  "\n\t",
  element({}, []),
  "\n")
];
```
