
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: string[];
  placeholder?: string;
  className?: string;
}

const CategorySelect = ({ 
  value, 
  onValueChange, 
  categories, 
  placeholder = "Select category",
  className 
}: CategorySelectProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onValueChange(newCategoryName.trim());
      setNewCategoryName("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "create-new") {
      setIsCreateDialogOpen(true);
    } else {
      onValueChange(selectedValue);
    }
  };

  return (
    <>
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
          <SelectItem value="create-new" className="text-primary">
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create new category
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Enter a name for the new category.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateCategory();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategorySelect;
