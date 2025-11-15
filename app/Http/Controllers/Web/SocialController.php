<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityLike;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialController extends Controller
{
    /**
     * Mostrar página social con feed
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Obtener feed de actividades
        $activities = Activity::feedFor($user)
            ->with(['user', 'likes.user'])
            ->recent()
            ->limit(50)
            ->get()
            ->map(function ($activity) use ($user) {
                return [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'description' => $activity->description,
                    'data' => $activity->data,
                    'image_url' => $activity->image_url,
                    'visibility' => $activity->visibility,
                    'likes_count' => $activity->likes_count,
                    'comments_count' => $activity->comments_count,
                    'is_liked' => $activity->isLikedBy($user),
                    'created_at' => $activity->created_at->toISOString(),
                    'user' => [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'avatar' => $activity->user->avatar,
                    ],
                ];
            });

        // Obtener estadísticas del usuario
        $stats = [
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'activities_count' => $user->activities()->count(),
        ];

        // Sugerencias de usuarios para seguir (usuarios con más seguidores que el usuario no sigue)
        $suggestedUsers = User::whereNotIn('id', $user->following()->pluck('following_id'))
            ->where('id', '!=', $user->id)
            ->withCount('followers')
            ->orderBy('followers_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($suggestedUser) {
                return [
                    'id' => $suggestedUser->id,
                    'name' => $suggestedUser->name,
                    'avatar' => $suggestedUser->avatar,
                    'followers_count' => $suggestedUser->followers_count,
                ];
            });

        return Inertia::render('social', [
            'activities' => $activities,
            'stats' => $stats,
            'suggested_users' => $suggestedUsers,
        ]);
    }

    /**
     * Seguir a un usuario
     */
    public function follow(Request $request, $userId)
    {
        $user = $request->user();
        $targetUser = User::findOrFail($userId);

        if ($user->id === $targetUser->id) {
            return response()->json(['error' => 'No puedes seguirte a ti mismo'], 400);
        }

        $user->follow($targetUser);

        return response()->json([
            'message' => 'Ahora sigues a '.$targetUser->name,
            'is_following' => true,
        ]);
    }

    /**
     * Dejar de seguir a un usuario
     */
    public function unfollow(Request $request, $userId)
    {
        $user = $request->user();
        $targetUser = User::findOrFail($userId);

        $user->unfollow($targetUser);

        return response()->json([
            'message' => 'Dejaste de seguir a '.$targetUser->name,
            'is_following' => false,
        ]);
    }

    /**
     * Obtener seguidores de un usuario
     */
    public function followers(Request $request, $userId)
    {
        $targetUser = User::findOrFail($userId);
        $currentUser = $request->user();

        $followers = $targetUser->followers()
            ->withCount('followers')
            ->get()
            ->map(function ($follower) use ($currentUser) {
                return [
                    'id' => $follower->id,
                    'name' => $follower->name,
                    'avatar' => $follower->avatar,
                    'followers_count' => $follower->followers_count,
                    'is_following' => $currentUser->isFollowing($follower),
                ];
            });

        return response()->json($followers);
    }

    /**
     * Obtener usuarios que sigue
     */
    public function following(Request $request, $userId)
    {
        $targetUser = User::findOrFail($userId);
        $currentUser = $request->user();

        $following = $targetUser->following()
            ->withCount('followers')
            ->get()
            ->map(function ($followedUser) use ($currentUser) {
                return [
                    'id' => $followedUser->id,
                    'name' => $followedUser->name,
                    'avatar' => $followedUser->avatar,
                    'followers_count' => $followedUser->followers_count,
                    'is_following' => $currentUser->isFollowing($followedUser),
                ];
            });

        return response()->json($following);
    }

    /**
     * Dar like a una actividad
     */
    public function likeActivity(Request $request, $activityId)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($activityId);

        // Verificar si ya dio like
        $existingLike = ActivityLike::where('activity_id', $activityId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingLike) {
            return response()->json(['error' => 'Ya diste like a esta actividad'], 400);
        }

        // Crear like
        ActivityLike::create([
            'activity_id' => $activityId,
            'user_id' => $user->id,
        ]);

        // Incrementar contador
        $activity->increment('likes_count');

        return response()->json([
            'message' => 'Like agregado',
            'likes_count' => $activity->fresh()->likes_count,
        ]);
    }

    /**
     * Quitar like de una actividad
     */
    public function unlikeActivity(Request $request, $activityId)
    {
        $user = $request->user();
        $activity = Activity::findOrFail($activityId);

        $like = ActivityLike::where('activity_id', $activityId)
            ->where('user_id', $user->id)
            ->first();

        if (!$like) {
            return response()->json(['error' => 'No has dado like a esta actividad'], 400);
        }

        $like->delete();

        // Decrementar contador
        $activity->decrement('likes_count');

        return response()->json([
            'message' => 'Like eliminado',
            'likes_count' => $activity->fresh()->likes_count,
        ]);
    }

    /**
     * Buscar usuarios
     */
    public function searchUsers(Request $request)
    {
        $query = $request->input('query');
        $currentUser = $request->user();

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->where('id', '!=', $currentUser->id)
            ->withCount('followers')
            ->limit(10)
            ->get()
            ->map(function ($user) use ($currentUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar,
                    'followers_count' => $user->followers_count,
                    'is_following' => $currentUser->isFollowing($user),
                ];
            });

        return response()->json($users);
    }

    /**
     * Obtener ranking de usuarios (leaderboard)
     */
    public function leaderboard(Request $request)
    {
        $currentUser = $request->user();
        $type = $request->input('type', 'followers'); // followers, activities, points

        $query = User::query();

        switch ($type) {
            case 'followers':
                $query->withCount('followers')->orderBy('followers_count', 'desc');
                break;
            case 'activities':
                $query->withCount('activities')->orderBy('activities_count', 'desc');
                break;
            default:
                $query->withCount('followers')->orderBy('followers_count', 'desc');
        }

        $topUsers = $query->limit(20)->get()->map(function ($user, $index) use ($currentUser) {
            return [
                'rank' => $index + 1,
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'score' => $user->followers_count ?? $user->activities_count ?? 0,
                'is_following' => $currentUser->isFollowing($user),
                'is_current_user' => $user->id === $currentUser->id,
            ];
        });

        return response()->json($topUsers);
    }
}
