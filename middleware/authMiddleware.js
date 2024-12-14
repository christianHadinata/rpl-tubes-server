import { getRoleUserInSidang } from "../controllers/user.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import jwt from "jsonwebtoken";

// role : string[]
export const authMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log(token);
    if (!token) {
      throw new UnauthorizedError("token not provided");
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      const email = payload.email;

      if (allowedRoles.length === 1 && allowedRoles[0] === "Koordinator") {
        if (payload.role !== "Koordinator") {
          next(
            new UnauthorizedError("you are not allowed to access this resource")
          );
        }
      }

      if (payload.role === "Koordinator" || payload.role === "Admin") {
        req.user = { ...payload, role: payload.role };
      } else {
        const idSidang = req.query.idSidang;
        console.log("idSidang: " + idSidang);

        if (!idSidang) {
          return next(new UnauthorizedError("idSidang is required"));
        }

        const userRole = await getRoleUserInSidang(idSidang, email);
        console.log("roleUser: " + userRole);
        console.log("allowedRoles: " + allowedRoles);
        console.log(
          "allowedRolesIncluded: " + !allowedRoles.includes(userRole)
        );

        if (!userRole) {
          return next(new UnauthorizedError("User role not found"));
        }

        if (!allowedRoles.includes(userRole)) {
          next(
            new UnauthorizedError("you are not allowed to access this resource")
          );
        }

        req.user = { ...payload, role: userRole };
      }
      next();
    } catch (err) {
      throw new UnauthorizedError("invalid token");
    }
  };
};
