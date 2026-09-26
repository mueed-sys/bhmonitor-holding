import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { LangContext, useLangProvider } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";
import Home from "@/pages/home";
import Pledge from "@/pages/pledge";
import Wall from "@/pages/wall";
import PledgeAbout from "@/pages/pledge-about";
function Routes() { return <Switch><Route path="/" component={Home} /><Route path="/pledge" component={Pledge} /><Route path="/wall" component={Wall} /><Route path="/pledge/about" component={PledgeAbout} /><Route component={Home} /></Switch>; }
export default function App() { const language = useLangProvider(); return <QueryClientProvider client={queryClient}><LangContext.Provider value={language}><div className="dark min-h-screen bg-background text-foreground"><Routes /></div><Toaster /></LangContext.Provider></QueryClientProvider>; }
