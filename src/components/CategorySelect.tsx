
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCategories, saveCategory, generateId, Category } from "@/lib/supabaseStorage";
import { useToast } from "@/hooks/use-toast";

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories?: string[]; // Keep for backward compatibility but won't be used
  placeholder?: string;
}

const CategorySelect = ({ value, onValueChange, placeholder = "Select category" }: CategorySelectProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadCategories = async () => {
    try {
      const loadedCategories = await getCategories();
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      const newCategory: Omit<Category, 'created_at' | 'updated_at'> = {
        id: generateId("CAT"),
        name: newCategoryName.trim(),
        is_active: true,
      };

      await saveCategory(newCategory);
      await loadCategories();
      onValueChange(newCategory.name);
      setNewCategoryName("");
      
      toast({
        title: "Success",
        description: `Category "${newCategory.name}" created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
      console.error("Error creating category:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={setIsOpen}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.name}>
            {category.name}
          </SelectItem>
        ))}
        <div className="border-t mt-2 pt-2">
          <div className="flex gap-2 p-2">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateCategory();
                }
              }}
              className="h-8"
            />
            <Button
              size="sm"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isCreating}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
