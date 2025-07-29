import { Phone } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary rounded-lg p-2">
              <Phone className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Voice Agent</h1>
              <p className="text-sm text-muted-foreground">Store Call Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Store Directory</span>
          </div>
        </div>
      </div>
    </nav>
  );
};