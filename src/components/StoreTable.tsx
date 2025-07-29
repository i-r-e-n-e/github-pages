import { useState } from "react";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Phone, Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface StoreTableProps {
  stores: Store[];
  onEditStore: (store: Store) => void;
  onDeleteStore: (id: string) => void;
  onCallStore: (store: Store) => void;
  onCallAll: () => void;
}

export const StoreTable = ({ stores, onEditStore, onDeleteStore, onCallStore, onCallAll }: StoreTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredStores = stores.filter(store => 
    store.phone_number.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const uncalledStores = stores.filter(store => !store.last_called || store.last_called === '');

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getCallStatus = (lastCalled: string | undefined) => {
    if (!lastCalled) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    
    const daysSinceCall = Math.floor((new Date().getTime() - new Date(lastCalled).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCall <= 7) {
      return <Badge className="bg-success text-success-foreground">Recent</Badge>;
    } else if (daysSinceCall <= 30) {
      return <Badge className="bg-warning text-warning-foreground">Stale</Badge>;
    } else {
      return <Badge variant="destructive">Old</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and call all button */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {filteredStores.length} of {stores.length} stores
          </span>
          {uncalledStores.length > 0 && (
            <Button 
              onClick={onCallAll}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call All ({uncalledStores.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                </div>
              </TableHead>
              <TableHead className="w-[150px]">Store Name</TableHead>
              <TableHead className="w-[100px]">Created</TableHead>
              <TableHead className="w-[120px]">Last Called</TableHead>
              <TableHead className="w-[200px]">Location</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {stores.length === 0 ? "No stores added yet. Add your first store to get started." : "No stores match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-mono text-sm">
                    {store.phone_number}
                  </TableCell>
                  <TableCell className="text-sm">
                    {store.store_name || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(store.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(store.last_called)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm" title={store.location}>
                    {store.location || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {getCallStatus(store.last_called)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCallStore(store)}
                        className="h-8 w-8 p-0"
                        title="Call Store"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditStore(store)}
                        className="h-8 w-8 p-0"
                        title="Edit Store"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteStore(store.id)}
                        className="h-8 w-8 p-0"
                        title="Delete Store"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};