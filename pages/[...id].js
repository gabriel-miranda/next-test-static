import React from 'react';
import { SHARED_PATH } from '../lib/blocks';

function BOB(props) {
  const { default: Page } = require(`../components/${props.type}`);
  return <Page {...props} />
}

export async function getStaticProps({ params }) {
  const fs = require('fs').promises;
  const data = await fs.readdir('./data');
  const { id } = params;
  let props = {};
  let calls = [];
  let add = {};

  /**
   * Find the static props for our Page
  */
  // Traverse our data file
  data.forEach((file) =>  {
    // For each of those read the file
    const current = require(`../data/${file}`);
    // And read every language
    const langs = Object.keys(current);

    // For each language
    langs.forEach((lang) => {
      // See if the path is equal to the id
      if (current[lang].path === id.join('/')) {
        // If it matches grab the external key and save it in calls
        calls = current[lang].external;
        // and set our props for our page
        props = { ...current[lang], lang };
      }
    });
  });

  /**
   * Peek inside external key to make async calls
   * for each component in the external key and adding external data
  */
  // Traverse all calls / external
  await Promise.all(calls.map(async (component) => {
    // Find the current component
    const current = props.blocks.find(({ id }) => component === id);
    if (!current) {
      console.error(`Component: ${component} not found in page: ${props.type}`);
      return;
    }
    // Set the subpath depending if the component is shared or not
    const subpath = current.shared ? SHARED_PATH : `${props.type}/blocks`;
    // Require the getExternalData function to then use it
    const { getExternalData } = require(`../components/${subpath}/${current.id}`);
    // Make the call
    if (typeof getExternalData !== 'function') {
      console.error(`Missing method getExternalData in component: ${component}`);
      return;
    }
    add = await getExternalData();
    if (typeof add !== 'object') {
      console.error(`The exported function getExternalData() does not return an object in component: ${component}`);
    }
    // Find the block, and add the prop "external" to the desired component
    props.blocks = props.blocks.map(block => {
      if (block.id === component) {
        block.props.external = add;
      }
      return block;
    });
  }));

  return {
    props,
  }
}

export async function getStaticPaths() {
  const fs = require('fs').promises;
  const data = await fs.readdir('./data');
  const paths = [];

  data.forEach((file) =>  {
    const current = require(`../data/${file}`);
    const langs = Object.keys(current);
    langs.forEach((lang) => {
      paths.push({ params: { id: current[lang].path.split('/') }})
    })
  });

  return {
    paths,
    fallback: false,
  };
}

export default BOB;
