import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroHeader from "../components/planner/HeroHeader";
import LocationSelector from "../components/planner/LocationSelector";
import WeatherDisplay from "../components/planner/WeatherDisplay";
import UserPreferences from "../components/planner/UserPreferences";
import AreaRestaurants from "../components/planner/AreaRestaurants";
import PreferenceSummary from "../components/planner/PreferenceSummary";
import OutingResults from "../components/planner/OutingResults";
import LivePoll from "../components/planner/LivePoll";
import TransportOptions from "../components/planner/TransportOptions";
import {
  OUTING_PLACES,
  aggregatePreferences,
  filterVenues,
  scoreVenues,
} from "@/lib/outingData";

export default function Home() {
  const [location, setLocation] = useState({ country: "", state: "", city: "" });
  const [date, setDate] = useState("");
  const [users, setUsers] = useState([{ activity: "", food: "", gender: "" }]);
  const [area, setArea] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [votes, setVotes] = useState({});

  const isReady =
    location.city &&
    date &&
    users.every(u => u.activity && u.food && u.gender);

  const { prefs, rankedPlans } = useMemo(() => {
    if (!showResults) return { prefs: null, rankedPlans: [] };
    const prefs = aggregatePreferences(users);
    const filtered = filterVenues(OUTING_PLACES, prefs.isMixed);
    const ranked = scoreVenues(filtered, prefs);
    return { prefs, rankedPlans: ranked };
  }, [showResults, users]);

  const handleGenerate = () => {
    setVotes({});
    setShowResults(true);
  };

  const handleVote = (idx) => {
    setVotes(prev => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600">
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <HeroHeader />

        <div className="space-y-5">
          <LocationSelector location={location} setLocation={setLocation} />
          <WeatherDisplay date={date} setDate={setDate} />
          <UserPreferences users={users} setUsers={setUsers} />
          <AreaRestaurants city={location.city} area={area} setArea={setArea} />
          <TransportOptions />

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center pt-2"
          >
            <Button
              onClick={handleGenerate}
              disabled={!isReady}
              size="lg"
              className="h-14 px-10 rounded-2xl text-base font-heading font-semibold gap-2 shadow-xl shadow-primary/30 disabled:opacity-40"
            >
              <Zap className="w-5 h-5" />
              Generate AI Recommendations
            </Button>
          </motion.div>

          {/* Results */}
          {showResults && prefs && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 pt-4"
            >
              <PreferenceSummary prefs={prefs} />
              <OutingResults
                plans={rankedPlans}
                userCount={users.length}
                votes={{}}
                onVote={() => {}}
              />
              {rankedPlans.length >= 3 && (
                <LivePoll plans={rankedPlans} />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}