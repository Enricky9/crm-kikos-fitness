import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { HttpError } from "../../../shared/api/http";
import { useAuth } from "../AuthContext";

const loginFormSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido"),
  password: z.string().min(1, "Informe a senha")
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LocationState = {
  readonly from?: {
    readonly pathname?: string;
  };
};

export const useLoginForm = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? "/dashboard";

  const submit = form.handleSubmit(async (values) => {
    setErrorMessage(null);

    try {
      await auth.login(values);
      void navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof HttpError) {
        setErrorMessage(error.payload.error.message);
        return;
      }

      setErrorMessage("Nao foi possivel entrar agora");
    }
  });

  return {
    errorMessage,
    form,
    redirectTo,
    status: auth.status,
    submit
  };
};
