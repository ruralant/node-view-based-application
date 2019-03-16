const deleteProduct = async (btn) => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  const productDomElement = btn.closest('article');

  try {
    const result = await fetch(`/admin/product/${prodId}`, {
      method: 'DELETE',
      headers: { 'csrf-token': csrf }
    });
    await result.json();
    productDomElement.remove();
  } catch (e) {
    console.log(e);
  }
};