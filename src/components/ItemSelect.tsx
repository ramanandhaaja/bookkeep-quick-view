
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getItems, Item } from "@/lib/supabaseStorage";

interface ItemSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onItemSelect?: (item: Item) => void;
  placeholder?: string;
}

const ItemSelect = ({ value, onValueChange, onItemSelect, placeholder = "Select item" }: ItemSelectProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const loadedItems = await getItems();
      setItems(loadedItems);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSelect = (item: Item) => {
    onValueChange(item.name);
    if (onItemSelect) {
      onItemSelect(item);
    }
    setOpen(false);
  };

  const handleCreateNew = (inputValue: string) => {
    if (inputValue.trim()) {
      onValueChange(inputValue.trim());
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            {loading ? (
              <CommandEmpty>Loading items...</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-4">
                    <span>No items found.</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
                        const inputValue = input?.value || '';
                        handleCreateNew(inputValue);
                      }}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create new item
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => handleSelect(item)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ItemSelect;
