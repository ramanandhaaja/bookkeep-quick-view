
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
import { getAccountNames, saveAccount } from "@/lib/supabaseStorage";
import { useToast } from "@/hooks/use-toast";

interface AccountSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const AccountSelect = ({ value, onValueChange, placeholder = "Select account" }: AccountSelectProps) => {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const loadedAccounts = await getAccountNames();
      setAccounts(loadedAccounts);
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSelect = (accountName: string) => {
    onValueChange(accountName);
    setOpen(false);
  };

  const handleCreateNew = async (inputValue: string) => {
    if (inputValue.trim()) {
      try {
        await saveAccount(inputValue.trim());
        await loadAccounts(); // Reload accounts
        onValueChange(inputValue.trim());
        setOpen(false);
        toast({
          title: "Success",
          description: `Account "${inputValue.trim()}" created successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
        console.error("Error creating account:", error);
      }
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
          <CommandInput placeholder="Search accounts..." />
          <CommandList>
            {loading ? (
              <CommandEmpty>Loading accounts...</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 py-4">
                    <span>No accounts found.</span>
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
                      Create new account
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {accounts.map((account) => (
                    <CommandItem
                      key={account}
                      value={account}
                      onSelect={() => handleSelect(account)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === account ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {account}
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

export default AccountSelect;
