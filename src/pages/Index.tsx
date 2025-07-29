import { useState, useEffect } from "react";
import { Store, StoreFormData } from "@/types/store";
import { Navbar } from "@/components/Navbar";
import { StoreTable } from "@/components/StoreTable";
import { StoreDialog } from "@/components/StoreDialog";
import { CSVUploader } from "@/components/CSVUploader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<Store | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load stores from Supabase on component mount
  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('voice agent')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading stores:', error);
        toast({
          title: "Error loading stores",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform data to match our Store interface
      const storesData: Store[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        phone_number: item.phone_number,
        created: item.created,
        last_called: item.last_called || '',
        location: item.location || '',
        store_name: item.store_name || '',
        transcript: '',
      }));

      setStores(storesData);
    } catch (err: any) {
      console.error('Error loading stores:', err);
      toast({
        title: "Error loading stores",
        description: "Failed to load stores from database",
        variant: "destructive",
      });
    }
  };

  const handleAddStore = async (data: StoreFormData) => {
    try {
      const { data: result, error } = await supabase
        .from('voice agent')
        .insert({
          phone_number: parseInt(data.phone_number),
          store_name: data.store_name,
          location: data.location,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error adding store:', error);
        toast({
          title: "Error adding store",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform the result to match our Store interface
      const newStore: Store = {
        id: result.id,
        created_at: result.created_at,
        phone_number: result.phone_number,
        created: result.created,
        last_called: result.last_called || '',
        location: result.location || '',
        store_name: result.store_name || '',
        transcript: '',
      };

      setStores([newStore, ...stores]);
      toast({
        title: "Store added",
        description: "New store has been added successfully",
      });
    } catch (err: any) {
      console.error('Error adding store:', err);
      toast({
        title: "Error adding store",
        description: "Failed to add store to database",
        variant: "destructive",
      });
    }
  };

  const handleEditStore = async (data: StoreFormData) => {
    if (!editingStore) return;
    
    try {
      const { data: result, error } = await supabase
        .from('voice agent')
        .update({
          phone_number: parseInt(data.phone_number),
          store_name: data.store_name,
          location: data.location,
        })
        .eq('id', editingStore.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating store:', error);
        toast({
          title: "Error updating store",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform the result to match our Store interface
      const updatedStore: Store = {
        id: result.id,
        created_at: result.created_at,
        phone_number: result.phone_number,
        created: result.created,
        last_called: result.last_called || '',
        location: result.location || '',
        store_name: result.store_name || '',
        transcript: '',
      };

      setStores(stores.map(store => 
        store.id === editingStore.id ? updatedStore : store
      ));
      setEditingStore(undefined);
      toast({
        title: "Store updated",
        description: "Store information has been updated",
      });
    } catch (err: any) {
      console.error('Error updating store:', err);
      toast({
        title: "Error updating store",
        description: "Failed to update store in database",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('voice agent')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting store:', error);
        toast({
          title: "Error deleting store",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setStores(stores.filter(store => store.id !== id));
      toast({
        title: "Store deleted",
        description: "Store has been removed",
      });
    } catch (err: any) {
      console.error('Error deleting store:', err);
      toast({
        title: "Error deleting store",
        description: "Failed to delete store from database",
        variant: "destructive",
      });
    }
  };

  const handleCSVUpload = async (csvStores: StoreFormData[]) => {
    try {
      const storeInserts = csvStores.map(data => ({
        phone_number: parseInt(data.phone_number),
        store_name: data.store_name,
        location: data.location,
      }));

      const { data: results, error } = await supabase
        .from('voice agent')
        .insert(storeInserts as any)
        .select();

      if (error) {
        console.error('Error uploading CSV stores:', error);
        toast({
          title: "Error uploading stores",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform results to match our Store interface
      const newStores: Store[] = (results || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        phone_number: item.phone_number,
        created: item.created,
        last_called: item.last_called || '',
        location: item.location || '',
        store_name: item.store_name || '',
        transcript: '',
      }));

      setStores([...newStores, ...stores]);
      toast({
        title: "Stores uploaded",
        description: `${newStores.length} stores have been added`,
      });
    } catch (err: any) {
      console.error('Error uploading CSV stores:', err);
      toast({
        title: "Error uploading stores",
        description: "Failed to upload stores to database",
        variant: "destructive",
      });
    }
  };

  const handleCallStore = async (store: Store) => {
    try {
      const res = await fetch("http://localhost:3001/call-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: store.phone_number })
      });

      const data = await res.json();
      if (data.success) {
        // Update the store's last_called to current date in Supabase
        const { error } = await supabase
          .from('voice agent')
          .update({ last_called: new Date().toISOString().split('T')[0] })
          .eq('id', store.id);

        if (!error) {
          setStores(stores.map(s => 
            s.id === store.id 
              ? { ...s, last_called: new Date().toISOString().split('T')[0] }
              : s
          ));
        }

        toast({
          title: "Call dispatched",
          description: `Call initiated to ${store.phone_number}`,
        });
      } else {
        toast({
          title: "Call failed",
          description: data.error || "Failed to initiate call",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Connection error",
        description: "Failed to connect to calling service",
        variant: "destructive",
      });
    }
  };

  const handleCallAll = async () => {
    const uncalledStores = stores.filter(store => !store.last_called || store.last_called === '');
    
    try {
      // Call all uncalled stores
      for (const store of uncalledStores) {
        await fetch("http://localhost:3001/call-store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: store.phone_number })
        });
      }
      
      // Update all uncalled stores with current date in Supabase
      const currentDate = new Date().toISOString().split('T')[0];
      const storeIds = uncalledStores.map(store => store.id);
      
      const { error } = await supabase
        .from('voice agent')
        .update({ last_called: currentDate })
        .in('id', storeIds);

      if (!error) {
        setStores(stores.map(store => 
          storeIds.includes(store.id)
            ? { ...store, last_called: currentDate }
            : store
        ));
      }
      
      toast({
        title: "Calls dispatched",
        description: `Initiated calls to ${uncalledStores.length} stores`,
      });
    } catch (err: any) {
      toast({
        title: "Connection error",
        description: "Failed to connect to calling service",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (store: Store) => {
    setEditingStore(store);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingStore(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Store Directory</h2>
              <p className="text-muted-foreground">
                Manage stores for voice agent calls. Add store details and connect to your database.
              </p>
            </div>
            <div className="flex space-x-3">
              <CSVUploader onUpload={handleCSVUpload} />
              <StoreDialog
                store={editingStore}
                trigger={
                  <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store
                  </Button>
                }
                onSave={editingStore ? handleEditStore : handleAddStore}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <StoreTable
              stores={stores}
              onEditStore={openEditDialog}
              onDeleteStore={handleDeleteStore}
              onCallStore={handleCallStore}
              onCallAll={handleCallAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;