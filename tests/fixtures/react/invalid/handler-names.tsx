// @warnings: react/jsx-handler-names

/**
 * Invalid: Local functions passed to event handlers must be prefixed with "handle"
 */
const InvalidComponent = () => {
  // Invalid: local function without "handle" prefix
  const doSomething = () => {
    console.info('clicked');
  };

  // Invalid: local function without "handle" prefix
  const submitForm = () => {
    console.info('submitted');
  };

  return (
    <div>
      {/* Invalid: doSomething should be handleClick or similar */}
      <button type="button" onClick={doSomething}>
        Click
      </button>

      {/* Invalid: submitForm should be handleSubmit */}
      <form onSubmit={submitForm}>
        <button type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default InvalidComponent;
