function perform(anyMethods, wrappers) {
  wrappers.forEach((wrapper) => wrapper.initialize());
  anyMethods();
  wrappers.forEach((wrapper) => wrapper.close());
}

perform(
  function () {
    console.log("say");
  },
  [
    {
      initialize() {
        console.log("say前");
      },
      close() {
        console.log("say后");
      },
    },
    {
      initialize() {
        console.log("say前前");
      },
      close() {
        console.log("say后后");
      },
    },
  ]
);
