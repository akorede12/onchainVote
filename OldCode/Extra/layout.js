import styled from "@mui/material/styles";

// const useStyles = makeStyles({
//   page: {
//     background: "#f9f9f9",
//     width: "100%",
//   },
// });

export default function Layout({ children }) {
  // classes = useStyles();

  return <div /*className={classes.page}*/>{children}</div>;
}
