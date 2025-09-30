import { NavLink } from "react-router-dom";

export type LogoComponentParams = {
  theme: string;
};

const LogoComponent = ({ theme }: LogoComponentParams) => {
  const textColorClass = theme === "dark" ? "text-white" : "text-black";

  return (
    <NavLink to="/">
      <h1
        className={`fixed left-8 top-8 z-30 flex items-center ${textColorClass} text-3xl sm:text-2xl sm:left-4 sm:top-8`}
        style={{ fontFamily: '"Pacifico", cursive' }}
      >
        Teles
      </h1>
    </NavLink>
  );
};

export default LogoComponent;
