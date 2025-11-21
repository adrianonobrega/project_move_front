"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
}

export const StatusModal = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionLabel = "Fechar",
  onAction,
  cancelLabel,
  onCancel,
}: StatusModalProps) => {
  
  const handleAction = () => {
    if (onAction) onAction();
    else onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          
          {type === "success" && (
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          )}
          {type === "error" && (
            <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          )}
          {type === "warning" && (
            <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
          )}

          <DialogTitle className="text-2xl font-bold text-center">
            {title}
          </DialogTitle>
          
          <DialogDescription className="text-center text-zinc-400 text-base">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center gap-2">
          {onCancel && (
            <Button 
              variant="outline"
              onClick={onCancel}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white w-full sm:w-auto"
            >
              {cancelLabel || "Cancelar"}
            </Button>
          )}

          <Button 
            onClick={handleAction}
            className={`w-full sm:w-auto min-w-[120px] font-bold ${
              type === "success" ? "bg-green-600 hover:bg-green-700" :
              type === "warning" ? "bg-yellow-600 hover:bg-yellow-700 text-black" :
              "bg-red-600 hover:bg-red-700"
            }`}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};