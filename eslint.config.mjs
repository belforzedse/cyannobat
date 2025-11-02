import { FlatCompat } from '@eslint/eslintrc';
import { createRequire } from 'module';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'eslint-plugin-tailwindcss';

const require = createRequire(import.meta.url);
const jsxA11y = require('eslint-plugin-jsx-a11y');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const focusVisiblePlugin = {
  rules: {
    'require-focus-visible': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Ensure elements that disable default focus outlines provide a :focus-visible style.',
        },
        schema: [],
        messages: {
          requireFocusVisible:
            'Elements that remove the default focus outline must also define a :focus-visible style.',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name !== 'className' || !node.value) {
              return;
            }

            let classValue = '';

            if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
              classValue = node.value.value;
            } else if (node.value.type === 'JSXExpressionContainer') {
              const expression = node.value.expression;

              if (expression.type === 'Literal' && typeof expression.value === 'string') {
                classValue = expression.value;
              } else if (
                expression.type === 'TemplateLiteral' &&
                expression.expressions.length === 0
              ) {
                classValue = expression.quasis.map((quasi) => quasi.value.cooked ?? '').join('');
              }
            }

            if (
              classValue.includes('focus:outline-none') &&
              !classValue.includes('focus-visible:')
            ) {
              context.report({
                node: node.value,
                messageId: 'requireFocusVisible',
              });
            }
          },
        };
      },
    },
  },
};

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/scripts/**',
      'src/payload-migrations/**',
    ],
  },
  {
    plugins: {
      tailwindcss,
      'jsx-a11y': jsxA11y,
      'focus-visible': focusVisiblePlugin,
    },
    settings: {
      tailwindcss: {
        callees: ['clsx', 'cva', 'cn'],
        config: 'tailwind.config.js',
      },
    },
    rules: {
      'tailwindcss/no-custom-classname': 'warn',
      'focus-visible/require-focus-visible': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
    },
  },
];

export default eslintConfig;
