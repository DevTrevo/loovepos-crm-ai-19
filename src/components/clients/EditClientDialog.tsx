import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Client, useUpdateClient } from "@/hooks/useClients";
import { ClientForm } from "./ClientForm";

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  const updateClient = useUpdateClient();

  const handleSubmit = async (data: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!client) return;
    
    await updateClient.mutateAsync({
      id: client.id,
      ...data,
    });
    onOpenChange(false);
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <ClientForm
          client={client}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={updateClient.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}