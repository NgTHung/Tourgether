import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface EmailVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerify: (code: string) => void;
}

const EmailVerificationModal = ({
  open,
  onOpenChange,
  email,
  onVerify,
}: EmailVerificationModalProps) => {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (code.length === 6) {
      onVerify(code);
      setCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            To protect your account, we've sent a 6-digit verification code to{" "}
            <strong>{email}</strong>. Please enter it below to save your changes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-6">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter>
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6}
            variant="gradient"
            className="w-full"
          >
            Verify and Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;
