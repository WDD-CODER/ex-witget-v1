export const debounce = {
  bind(el, binding) {
    let timeout = null;
    const delay = binding.arg || 300;

    el._debounceHandler = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Use el.value directly to bypass Shadow DOM event masking
        if (typeof binding.value === 'function') {
          binding.value(el.value);
        }
      }, delay);
    };

    el.addEventListener('input', el._debounceHandler);
  },
  unbind(el) {
    el.removeEventListener('input', el._debounceHandler);
  }
};