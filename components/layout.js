import Paper from "@mui/material/Paper";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import styles from "../styles/Home.module.css";
import { Box } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { useRouter } from "next/router";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import ViewListIcon from "@mui/icons-material/ViewList";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const history = useRouter();
  //  const location = useLocation();

  const menuItems = [
    {
      text: "Create Election",
      icon: <CreateNewFolderIcon color="primary" />,
      path: "/",
    },
    {
      text: "My Elections",
      icon: <HowToVoteIcon color="primary" />,
      path: "/MyElections",
    },
    {
      text: "All Elections",
      icon: <ViewListIcon color="primary" />,
      path: "/AllElections",
    },
  ];

  return (
    <Box component="div" sx={{ display: "flex", overflow: "auto" }}>
      <Drawer sx={{ width: 350 }} variant="permanent" anchor="left">
        <Paper sx={{ width: 350, boxShadow: "none" }}>
          <div>
            <Typography variant="h5" sx={{ padding: 2 }}>
              {" "}
              OnChain Votes
            </Typography>
          </div>
          <ConnectButton showBalance={false} />
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                button
                onClick={() => history.push(item.path)}
                className={history.pathname == item.path ? styles.active : null}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Drawer>
      <Box sx={{ padding: 2, flexGrow: 1 }}>{children}</Box>
    </Box>
  );
}
