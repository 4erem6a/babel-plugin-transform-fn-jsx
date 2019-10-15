module.exports = ({ types: t }, { removeEmptyText = true } = {}) => {
  function transformJSXIdentifier({ name }) {
    return t.identifier(
      name
        .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
        .replace(/-/g, "")
    );
  }

  function transformAttributeValue(value) {
    if (t.isJSXExpressionContainer(value)) {
      return value.expression;
    }

    return value || t.booleanLiteral(true);
  }

  function buildAttributesObject(attributes) {
    const properties = [];

    attributes.forEach(attr => {
      if (t.isJSXSpreadAttribute(attr)) {
        properties.push(t.spreadElement(attr.argument));
      } else {
        const key = attr.name.name.includes(":")
          ? t.stringLiteral(attr.name.name)
          : t.identifier(attr.name.name);

        properties.push(
          t.objectProperty(key, transformAttributeValue(attr.value))
        );
      }
    });

    return t.objectExpression(properties);
  }

  function transformChildren(children) {
    return children.map(child => {
      if (t.isJSXExpressionContainer(child)) {
        return child.expression;
      }
      return child;
    });
  }

  function transformJSXMemberExpression({ object, property }) {
    object = t.isJSXMemberExpression(object)
      ? transformJSXMemberExpression(object)
      : transformJSXIdentifier(object);

    property = transformJSXIdentifier(property);

    return t.memberExpression(object, property);
  }

  return {
    name: "babel-plugin-transform-functional-jsx",
    inherits: require("@babel/plugin-syntax-jsx").default,
    visitor: {
      JSXText: {
        exit(path) {
          if (removeEmptyText && !path.node.value.trim()) {
            path.remove();
            return;
          }

          path.replaceWith(
            t.inherits(t.stringLiteral(path.node.value), path.node)
          );
        }
      },
      JSXFragment: {
        exit(path) {
          const { children } = path.node;

          path.replaceWith(t.arrayExpression(children));
        }
      },
      JSXAttribute: {
        exit(path) {
          if (t.isJSXNamespacedName(path.node.name)) {
            path.node.name = t.JSXIdentifier(
              `${path.node.name.namespace.name}:${path.node.name.name.name}`
            );
          }
        }
      },
      JSXElement: {
        exit(path) {
          const { children } = path.node;
          const { name, attributes } = path.node.openingElement;

          if (t.isJSXNamespacedName(name)) {
            path.replaceWith(
              t.callExpression(transformJSXIdentifier(name.namespace), [
                t.stringLiteral(transformJSXIdentifier(name.name).name),
                buildAttributesObject(attributes),
                t.arrayExpression(children)
              ])
            );
          } else {
            const callee = t.isJSXIdentifier(name)
              ? transformJSXIdentifier(name)
              : transformJSXMemberExpression(name);

            path.replaceWith(
              t.callExpression(callee, [
                buildAttributesObject(attributes),
                t.arrayExpression(transformChildren(children))
              ])
            );
          }
        }
      }
    }
  };
};
