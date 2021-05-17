export const createSingleError = (errorMessage) => {
  return { __typename: "Error", error: [errorMessage] };
}

export const createJoiError = (err) => {
  console.log("Error ", err)
  return { __typename: "Error", error: (err.details.map((e) => e.message)) };
};