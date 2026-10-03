import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Entry from "./Entry";
import { NotificationProvider } from "./context/NotificationManager";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./context/UseAuth";
import { CallLogProvider } from "./context/UseCallLog";
import { TicketProvider } from "./context/useTicket";
import "@fontsource-variable/raleway";
import "@fontsource-variable/sora/wght.css";
import "./styles/app.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const Theme = createTheme({
	typography: {
		// fontFamily: "Raleway Variable, sans-serif",
		fontFamily: "Sora Variable, sans-serif",
	},
});

const Main = () => {
	return (
		<>
			<BrowserRouter>
				<SocketProvider>
					<AuthProvider>
						<NotificationProvider>
							<CallLogProvider>
								<TicketProvider>
									<CssBaseline />
									<Entry />
								</TicketProvider>
							</CallLogProvider>
						</NotificationProvider>
					</AuthProvider>
				</SocketProvider>
			</BrowserRouter>
		</>
	);
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
	<ThemeProvider theme={Theme}>
		<Main />
	</ThemeProvider>,
);

// Register production-grade service worker for PWA offline capabilities
serviceWorkerRegistration.register();
