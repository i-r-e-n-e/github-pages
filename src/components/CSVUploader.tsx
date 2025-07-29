import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText } from "lucide-react";
import { StoreFormData } from "@/types/store";
import { useToast } from "@/hooks/use-toast";

interface CSVUploaderProps {
  onUpload: (stores: StoreFormData[]) => void;
}

export const CSVUploader = ({ onUpload }: CSVUploaderProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): StoreFormData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const phoneIndex = headers.findIndex(h => h.includes('phone'));
    const locationIndex = headers.findIndex(h => h.includes('location'));
    const storeNameIndex = headers.findIndex(h => h.includes('store') || h.includes('name'));

    if (phoneIndex === -1) {
      throw new Error('CSV must include a phone number column');
    }

    const stores: StoreFormData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''));
      
      if (values[phoneIndex]) {
        stores.push({
          phone_number: values[phoneIndex],
          location: locationIndex >= 0 ? values[locationIndex] || '' : '',
          store_name: storeNameIndex >= 0 ? values[storeNameIndex] || '' : '',
        });
      }
    }

    return stores;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const text = await file.text();
      const stores = parseCSV(text);
      
      if (stores.length === 0) {
        throw new Error('No valid store data found in CSV');
      }

      onUpload(stores);
      setOpen(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Upload successful",
        description: `${stores.length} stores imported from CSV`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
          
          {file && (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm">{file.name}</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>CSV Format Requirements:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Must include a column with "phone" in the header</li>
              <li>Optional columns: location, store_name</li>
              <li>First row should be headers</li>
              <li>Example: phone,store_name,location</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file}>
              Import Stores
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};