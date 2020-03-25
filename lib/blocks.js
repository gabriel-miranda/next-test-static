export const SHARED_PATH = '_shared';

export function Container({ type, blocks }) {
  return (
    blocks.map(({ id, props, shared }) => {
      const subpath = shared ? SHARED_PATH : `${type}/blocks`;
      try {
        const { default: CurrentComponent } = require(`../components/${subpath}/${id}`);
        return (
          <CurrentComponent key={id} {...props} />
        )
      } catch (error) {
        console.error(`Module ${id} not found for ${subpath}, check the file exists and has a default export`, error);
        return null;
      }
    })
  );
}