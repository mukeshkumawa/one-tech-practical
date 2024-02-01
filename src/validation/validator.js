import niv from "node-input-validator";

niv.extend("psswordValidate", async (data) => {
  // Define a regular expression for password validation
  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  if (!passwordRegex.test(data.value)) {
    return false;
  } else {
    return true;
  }
});

export async function userRegister(req, res, next) {
  const objValidation = new niv.Validator(req.body, {
    full_name: "required|maxLength:50",
    email: "required|email|maxLength:50",
    password: "required|minLength:8|maxLength:16|psswordValidate: password",
  });
  const matched = await objValidation.check();

  if (!matched) {
    return res
      .status(422)
      .send({ message: "Validation error", errors: objValidation.errors });
  } else {
    next();
  }
}

export async function userLogin(req, res, next) {
  const objValidation = new niv.Validator(req.body, {
    email: "required|email",
    password: "required",
  });
  const matched = await objValidation.check();

  if (!matched) {
    return res
      .status(422)
      .send({ message: "Validation error", errors: objValidation.errors });
  } else {
    next();
  }
}

export async function userEdit(req, res, next) {
  const objValidation = new niv.Validator(req.body, {
    full_name: "required|maxLength:50",
    email: "required|email|maxLength:50",
  });
  const matched = await objValidation.check();

  if (!matched) {
    return res
      .status(422)
      .send({ message: "Validation error", errors: objValidation.errors });
  } else {
    next();
  }
}

export async function addProducts(req, res, next) {
  if (!req.file) {
    return res.status(422).send({
      message: "Validation error",
      errors: {
        product_csv: {
          message: "The product csv field is mandatory.",
          rule: "required",
        },
      },
    });
  } else {
    next();
  }
}

export async function allUsers(req, res, next) {
  const objValidation = new niv.Validator(req.query, {
    orderto: "nullable|in:_id,createdAt,full_name,email",
    orderby: "nullable|in:1,-1",
  });
  const matched = await objValidation.check();

  if (!matched) {
    return res
      .status(422)
      .send({ message: "Validation error", errors: objValidation.errors });
  } else {
    next();
  }
}
