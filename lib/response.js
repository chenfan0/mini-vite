function handleResponse(ctx, type, content) {
  ctx.type = type;
  ctx.body = content;
}

module.exports = {
  handleResponse,
};
