import { useState, useEffect } from "react";
import { Store, StoreFormData } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface StoreDialogProps {
  store?: Store;
  trigger: React.ReactNode;
  onSave: (data: StoreFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const StoreDialog = ({ store, trigger, onSave, open, onOpenChange }: StoreDialogProps) => {
  const [formData, setFormData] = useState<StoreFormData>({
    phone_number: "",
    location: "",
    store_name: "",
  });

  useEffect(() => {
    if (store) {
      setFormData({
        phone_number: store.phone_number.toString(),
        location: store.location,
        store_name: store.store_name,
      });
    } else {
      setFormData({
        phone_number: "",
        location: "",
        store_name: "",
      });
    }
  }, [store, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{store ? "Edit Store" : "Add New Store"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number *</Label>
            <Input
              id="phone_number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name *</Label>
            <Input
              id="store_name"
              placeholder="Store name"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="123 Main St, City, State 12345"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {store ? "Update Store" : "Add Store"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};