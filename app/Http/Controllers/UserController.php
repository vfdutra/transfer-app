<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class UserController extends Controller
{
    /**
     * Registra um novo usuário no sistema.
     *
     * @param Request $request
     *    - name: string (nome do usuário)
     *    - email: string (email único do usuário)
     *    - cpf: string (CPF único do usuário, 11 dígitos)
     *    - password: string (senha com mínimo de 8 caracteres)
     * @return \Illuminate\Http\JsonResponse
     *    - user: User (dados do usuário criado)
     *    - token: string (token de autenticação)
     * @throws \Exception
     *    - Erro ao criar usuário
     */
    public function register(Request $request)
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'cpf' => 'required|string|size:11|unique:users',
                'password' => 'required|string|min:8',
            ], [
                'name.required' => 'O nome é obrigatório',
                'name.max' => 'O nome não pode ter mais de 255 caracteres',
                'email.required' => 'O email é obrigatório',
                'email.email' => 'Digite um email válido',
                'email.unique' => 'Este email já está cadastrado',
                'cpf.required' => 'O CPF é obrigatório',
                'cpf.size' => 'O CPF deve ter 11 dígitos',
                'cpf.unique' => 'Este CPF já está cadastrado',
                'password.required' => 'A senha é obrigatória',
                'password.min' => 'A senha deve ter no mínimo 8 caracteres',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'cpf' => $request->cpf,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return response()->json([
                'user' => $user,
                'token' => $token
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (QueryException $e) {
            DB::rollBack();
            if (str_contains($e->getMessage(), 'users_email_unique')) {
                return response()->json([
                    'message' => 'Este email já está cadastrado',
                    'error' => 'O email informado já está em uso por outro usuário'
                ], 422);
            }
            if (str_contains($e->getMessage(), 'users_cpf_unique')) {
                return response()->json([
                    'message' => 'Este CPF já está cadastrado',
                    'error' => 'O CPF informado já está em uso por outro usuário'
                ], 422);
            }
            return response()->json([
                'message' => 'Erro ao criar usuário',
                'error' => 'Ocorreu um erro ao processar sua solicitação'
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao criar usuário',
                'error' => 'Ocorreu um erro inesperado ao processar sua solicitação'
            ], 500);
        }
    }

    /**
     * Autentica um usuário no sistema.
     *
     * @param Request $request
     *    - email: string (email do usuário)
     *    - password: string (senha do usuário)
     * @return \Illuminate\Http\JsonResponse
     *    - user: User (dados do usuário autenticado)
     *    - token: string (token de autenticação)
     * @throws ValidationException
     *    - Credenciais inválidas
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.required' => 'O email é obrigatório',
            'email.email' => 'Digite um email válido',
            'password.required' => 'A senha é obrigatória',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
    * Atualiza os dados do usuário autenticado.
    *
    * @param Request $request
    *    - name, email, cpf, password (opcionais)
    * @return \Illuminate\Http\JsonResponse
    *    - user: User atualizado
    */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * Exclui a conta do usuário autenticado.

     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     *    - message: string
     */
    public function delete(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Usuário excluído com sucesso']);
    }

    /**
    * Mostra os dados de um usuário pelo ID.
    *
    * @param int $id
    * @return \Illuminate\Http\JsonResponse
    *    - user: {id, name, email, cpf}
    */
    public function show($id)
    {
        $user = \App\Models\User::find($id);
        
        if (!$user) {
            return response()->json(['message' => 'Usuário não encontrado.'], 404);
        }
    
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'cpf' => $user->cpf,
            ]
        ]);
    }

    /**
     * Retorna os dados do usuário autenticado.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'cpf' => $user->cpf,
            'balance' => $user->balance,
        ]);
    }
} 